const express = require("express");
const AdmZip = require("adm-zip");
const axios = require("axios");
const fs = require("fs");
const zlib = require("zlib");

const app = express();

app.get("/api/v1/dataset/:nombreArchivo", async (req, res) => {
  try {
    const cache = {}; // Agregar esta línea para definir la variable cache
    const zipUrl =
      "https://datos.gob.cl/dataset/5e8bb1f8-f0a5-4719-a877-38543545505b/resource/a7bf9f01-eb74-423a-9f59-5072cb123a14/download/gtfs-v82-po20230114.zip"; // URL del archivo .zip
    const zipFileName = "archivo.zip"; // Nombre de archivo temporal para guardar el .zip descargado

    // Descargar el archivo .zip
    const response = await axios.get(zipUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(zipFileName, response.data);

    // Extraer archivos .txt del .zip descargado
    const zip = new AdmZip(zipFileName);
    const entries = zip.getEntries();
    const archivosTxt = entries.filter((entry) =>
      entry.entryName.endsWith(".txt")
    );

    const archivoTxt = entries.find((entry) =>
      entry.entryName.endsWith(`${req.params.nombreArchivo}.txt`)
    );

    if (!archivoTxt) {
      res.status(404).json({ error: "Archivo no encontrado" });
      return;
    }

    const data = zip.readAsText(archivoTxt);
    const jsonData = {
      nombre: archivoTxt.name.replace(/\.txt$/, ""), // Asignar el nombre del archivo al objeto jsonData
      contenido: parseDataToJson(data), // Función para transformar el contenido de texto a JSON
    };
    const nombreArchivo = req.params.nombreArchivo;
    // Verificar si los datos están en la caché
    if (cache[nombreArchivo]) {
      res.json(cache[nombreArchivo]);
      return;
    }
    // Eliminar el archivo .zip temporal
    setTimeout(() => {
      fs.unlinkSync(zipFileName); // Eliminar el archivo .zip temporal después de un cierto período de tiempo
    }, 5000); // Eliminar después de 1 minuto (ajusta el valor según tus necesidades)
    // Almacenar los datos en la caché
    cache[nombreArchivo] = jsonData;

    res.json(jsonData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message }); // Mostrar el mensaje de error específico
  }
});

function parseDataToJson(data) {
  const lines = data.split("\n");
  const headers = lines[0].split(",");

  const jsonArray = lines.slice(1).reduce((acc, line) => {
    const values = line.split(",");
    const jsonObject = {};

    // Verificar si la línea está vacía
    if (values.some((value) => value.trim().length > 0)) {
      headers.forEach((header, index) => {
        const key = header.trim();
        const value = values[index]?.trim();
        jsonObject[key] = value?.replace(/\r$/, "");
      });

      acc.push(jsonObject);
    }

    return acc;
  }, []);

  return jsonArray;
}

// function compressJSON(jsonData) {
//   // Comprimir el JSON utilizando la biblioteca zlib
//   const compressedData = zlib.gzipSync(JSON.stringify(jsonData));

//   return compressedData;
// }

app.listen(3000, "0.0.0.0", () => {
  console.log("Servidor iniciado en el puerto 3000");
});

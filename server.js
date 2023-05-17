const express = require("express");
const AdmZip = require("adm-zip");
const axios = require("axios");
const fs = require("fs");
const zlib = require("zlib");

const app = express();

app.get("/api/v1/dataset/:nombreArchivo", async (req, res) => {
  try {
    const cache = {};
    const zipUrl =
      "https://datos.gob.cl/dataset/5e8bb1f8-f0a5-4719-a877-38543545505b/resource/a7bf9f01-eb74-423a-9f59-5072cb123a14/download/gtfs-v82-po20230114.zip";
    const zipFileName = "archivo.zip";

    const response = await axios.get(zipUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(zipFileName, response.data);

    const zip = new AdmZip(zipFileName);
    const entries = zip.getEntries();
    const archivoTxt = entries.find((entry) =>
      entry.entryName.endsWith(`${req.params.nombreArchivo}.txt`)
    );

    if (!archivoTxt) {
      res.status(404).json({ error: "Archivo no encontrado" });
      return;
    }

    const data = zip.readAsText(archivoTxt);

    const jsonData = {
      nombre: archivoTxt.name.replace(/\.txt$/, ""),
      contenido: parseDataToJson(data),
    };

    const nombreArchivo = req.params.nombreArchivo;

    if (cache[nombreArchivo]) {
      res.json(cache[nombreArchivo]);
      return;
    }

    const compressedData = zlib.gzipSync(JSON.stringify(jsonData));

    res.set({
      "Content-Type": "application/json",
      "Content-Encoding": "zip",
      "Content-Disposition": `attachment; filename=${nombreArchivo}.zip`,
    });

    res.send(compressedData);

    // Eliminar el archivo zip temporal después de enviar la respuesta
    fs.unlinkSync(zipFileName);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

function parseDataToJson(data) {
  const lines = data.split("\n");
  const headers = lines[0].split(",");

  const jsonArray = lines.slice(1).reduce((acc, line) => {
    const values = line.split(",");
    const jsonObject = {};

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

app.listen(3000, "0.0.0.0", () => {
  console.log("Servidor iniciado en el puerto 3000");
});

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
    const outputZipFileName = req.params.nombreArchivo +".zip"; // Nombre de archivo para el nuevo zip

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

    // Crear un nuevo archivo zip para almacenar los archivos extraídos
    const outputZip = new AdmZip();

    // Agregar el archivo solicitado al nuevo zip
    outputZip.addFile(archivoTxt.entryName, archivoTxt.getData());

    // Guardar el nuevo zip en el sistema de archivos
    outputZip.writeZip(outputZipFileName);

    // Leer el nuevo zip como un archivo binario
    const outputZipData = fs.readFileSync(outputZipFileName);

    // Establecer las cabeceras de la respuesta
    res.set({
      "Content-Disposition": `attachment; filename=${outputZipFileName}`,
      "Content-Type": "application/zip",
    });

    // Enviar el nuevo zip como respuesta
    res.send(outputZipData);

    // Eliminar los archivos temporales
    fs.unlinkSync(zipFileName);
    fs.unlinkSync(outputZipFileName);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message }); // Mostrar el mensaje de error específico
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Servidor iniciado en el puerto 3000");
});

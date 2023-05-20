const express = require("express");
const AdmZip = require("adm-zip");
const axios = require("axios");
const fs = require("fs");

const app = express();

app.get("/api/v1/dataset", async (req, res) => {
  try {
    const zipUrl = "https://datos.gob.cl/dataset/5e8bb1f8-f0a5-4719-a877-38543545505b/resource/a7bf9f01-eb74-423a-9f59-5072cb123a14/download/gtfs-v82-po20230114.zip"; // URL del archivo .zip original
    const outputZipFileName = "archivo.zip"; // Nombre de archivo para el nuevo zip

    // Descargar el archivo .zip original
    const response = await axios.get(zipUrl, { responseType: "arraybuffer" });

    // Crear un archivo zip con los datos descargados
    const zip = new AdmZip(response.data);

    const entries = zip.getEntries();
    const archivosTxt = entries.filter((entry) => entry.entryName.endsWith(".txt"));

    // Crear un nuevo archivo zip para almacenar los archivos .txt
    const outputZip = new AdmZip();

    // Agregar todos los archivos .txt al nuevo zip
    archivosTxt.forEach((archivoTxt) => {
      outputZip.addFile(archivoTxt.entryName, archivoTxt.getData());
    });

    // Obtener el contenido del nuevo zip como un buffer
    const outputZipData = outputZip.toBuffer();

    // Establecer las cabeceras de la respuesta
    res.set({
      "Content-Disposition": `attachment; filename=${outputZipFileName}`,
      "Content-Type": "application/zip",
    });

    // Enviar el nuevo zip como respuesta
    res.send(outputZipData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message }); // Mostrar el mensaje de error específico
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Servidor iniciado en el puerto 3000");
});

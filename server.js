const AdmZip = require("adm-zip");
const axios = require("axios");
const fs = require("fs");
const zlib = require("zlib");
//a
module.exports = async (req, res) => {
  try {
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

    const data = zip.readAsText(archivosTxt[0]);
    const jsonData = parseDataToJson(data); // Función para transformar el contenido de texto a JSON
    console.log(jsonData);
    const compressedData = compressJSON(jsonData); // Función para comprimir el JSON

    // Descomprimir el contenido comprimido
    const uncompressedData = zlib.unzipSync(compressedData);

    // Eliminar el archivo .zip temporal
    fs.unlinkSync(zipFileName);

    res.json(JSON.parse(uncompressedData));
  }  catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message }); // Mostrar el mensaje de error específico
  }

};
function parseDataToJson(data) {
  const lines = data.split("\n");
  const headers = lines[0].split(",");

  const jsonArray = lines.slice(1).map((line) => {
    const values = line.split(",");
    const jsonObject = {};
    headers.forEach((header, index) => {
      const key = header.trim(); // Eliminar espacios en blanco alrededor de la clave
      const value = values[index]?.trim(); // Eliminar espacios en blanco alrededor del valor
      jsonObject[key] = value?.replace(/\r$/, ""); // Eliminar el carácter de retorno de carro (\r)
    });
    return jsonObject;
  });

  return jsonArray;
}

function compressJSON(jsonData) {
  // Comprimir el JSON utilizando la biblioteca zlib
  const compressedData = zlib.gzipSync(JSON.stringify(jsonData));

  return compressedData;
}

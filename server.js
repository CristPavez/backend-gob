const AdmZip = require("adm-zip");
const axios = require("axios");

module.exports = async (req, res) => {
  try {
    const zipUrl =
      "https://datos.gob.cl/dataset/5e8bb1f8-f0a5-4719-a877-38543545505b/resource/a7bf9f01-eb74-423a-9f59-5072cb123a14/download/gtfs-v82-po20230114.zip"; // URL del archivo .zip

    // Descargar el archivo .zip
    const response = await axios.get(zipUrl, { responseType: "arraybuffer" });
    const zipData = response.data;

    // Extraer archivos .txt del .zip descargado
    const zip = new AdmZip(zipData);
    const entries = zip.getEntries();
    const archivosTxt = entries.filter((entry) =>
      entry.entryName.endsWith(".txt")
    );

    const contenidoJson = archivosTxt.map((entry) => {
      const data = zip.readAsText(entry);
      const jsonData = parseDataToJson(data); // Función para transformar el contenido de texto a JSON
      return {
        nombre: entry.name,
        contenido: jsonData,
      };
    });

    return res.status(200).json(contenidoJson);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al procesar la solicitud" });
  }
};

function parseDataToJson(data) {
  const lines = data.split("\n");
  const headers = lines[0].split(",");

  const jsonArray = lines.slice(1).map((line) => {
    const values = line.split(",");
    const jsonObject = {};
    headers.forEach((header, index) => {
      jsonObject[header] = values[index];
    });
    return jsonObject;
  });

  return jsonArray;
}

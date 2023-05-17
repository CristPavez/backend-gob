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
    
    const contenidoJson = archivosTxt[0]
    const data = zip.readAsText(contenidoJson);
    const contenidoJson2 = archivosTxt[1]
    const data2 = zip.readAsText(contenidoJson2);
    const contenidoJson2 = archivosTxt[2]
    const data3 = zip.readAsText(contenidoJson);
    
    return res.status(200).json(data2);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al procesar la solicitud." });
  }
};

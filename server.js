const AdmZip = require("adm-zip");
const axios = require("axios");

module.exports = async (req, res) => {
  try {

    return res.status(200).json('{"glossary":2}');
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al procesar la solicitud." });
  }
};

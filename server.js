const express = require("express");
const AdmZip = require("adm-zip");
const axios = require("axios");
const fs = require("fs");

const app = express();

app.get("/api/v1/dataset", async (req, res) => {
  try {
 
    res.json('0');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

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

app.listen(3000, "0.0.0.0", () => {
  console.log("Servidor iniciado en el puerto 3000");
});

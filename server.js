
//a
module.exports = async (req, res) => {
  try {
 
    res.json("xd");
  }  catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message }); // Mostrar el mensaje de error específico
  }

};
 

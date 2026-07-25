import ProductDatabasePostgres from '../../database/product-database-postgres.js';

const database = new ProductDatabasePostgres();

const create = async (req, res) => {
  const { title, description, price, imageUrl, category_id } = req.body

  try{
    await database.create({
      title,
      description,
      price,
      imageUrl,
      category_id
    });

    return res.send({ 
      title,
      description,
      price,
      imageUrl,
      category_id
    });
    
  } catch(err) {
    return res.status(400).send({ error: true, message: 'Error while creating the product: ' + err });
  }
};

const rankeds = async (_, res) => {
  try{
    const products = await database.getRankeds(5);
    const productsBanner = await database.getRankeds(1);
    if (products) {
      return res.send({
        bannerProducts: Object.values(productsBanner),
        rankedProducts : getRankProductsByCategory(products)
      });
    } else {
      return res.status(404).send({ error: true, message: "Products Not Found" });
   }
    
  } catch(err) {
    return res.status(500).send({ error: true, message: 'Internal Server Error', details: err.message });
  }
};

function getRankProductsByCategory(products) {
  const productsByCategory = {};

  products.forEach((product) => {
    if (!productsByCategory[product.category_id]) {
      productsByCategory[product.category_id] = {
        category_id: product.category_id,
        category_name: product.category_name,
        products: [],
      };
    }
    productsByCategory[product.category_id].products.push(product);
  });

  const rankedProductsList = Object.values(productsByCategory);

  return rankedProductsList;
}

const find = async (req, res) => {
  if (req.query.id) {
    findById(req, res);
  } else if (req.query.category) {
    findByCategoryId(req, res);
  } else {
    findAll(req, res);
  }
};

const findAll = async (req, res) => {
  try{
    const products = await database.getAll();
    
    return res.send({ "products": products });
  } catch(err) {
    return res.status(400).send({ "error": true, "message": 'Get All Products Failed: ' + err });
  }
};

const findById = async (req, res) => {
  const id = req.query.id;
  try{
    const product = await database.findById(id);

    if (product) {
      return res.send(product);
    } else {
      return res.status(404).send({ "error": true, "message": "Product Not Found" });
   }
    
  } catch(err) {
    return res.status(500).send({ error: true, message: 'Internal Server Error', details: err.message });
  }
};

const findByCategoryId = async (req, res) => {
  const categoryId = req.query.category;
  try{
    const products = await database.findByCategoryId(categoryId);

    if (products) {
      return res.send(products);
    } else {
      return res.status(404).send({ "error": true, "message": "Products Not Found" });
   }
    
  } catch(err) {
    return res.status(500).send({ error: true, message: 'Internal Server Error', details: err.message });
  }
};

export default { create, find, rankeds };
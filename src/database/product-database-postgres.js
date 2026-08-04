import { sql } from "./db.js";

export default class ProductDatabasePostgres {

  async create(product) {
    const { title, description, price, imageUrl, category_id } = product

    await sql`INSERT INTO products (title, description, price, imageUrl, category_id) VALUES (${title}, ${description}, ${price}, ${imageUrl}, ${category_id})`
  }

  async findById(id) {
    try {
      const product = await sql`
        SELECT
          p.id,
          p.title,
          p.description,
          p.price,
          p.imageurl,
          c.id AS category_id,
          c.name AS category_name
        FROM
          products p
          INNER JOIN categories c ON p.category_id = c.id
        WHERE
          p.id = ${id};
      `;
  
      if (product.length > 0) {
        return product[0];
      } else {
        return null;
      }
    } catch (err) {
      throw new Error(`Erro ao obter o produto: ${err.message}`);
    }
  }

  async findByCategoryId(id) {
    const products = await sql`
      SELECT
        p.id,
        p.title,
        p.description,
        p.price,
        p.imageUrl,
        p.category_id,
        c.name AS category_name
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ${id};
    `;

    if (products.length > 0) {
      return products;
    } else {
      return null;
    }
  }

  async getRankeds(maxQuantity) {
    const products = await sql`
      WITH ProductsWithRanks AS (
        SELECT
          p.id AS product_id,
          p.title,
          p.description,
          p.price,
          p.imageUrl,
          p.category_id,
          c.name AS category_name,
          ROW_NUMBER() OVER (PARTITION BY p.category_id ORDER BY RANDOM()) AS product_rank
        FROM
          products p
          INNER JOIN categories c ON p.category_id = c.id
        WHERE
          p.category_id IN (1, 2, 3, 4, 5)
      )
      SELECT
        product_id AS id,
        title,
        description,
        price,
        imageUrl,
        category_id,
        category_name
      FROM
        ProductsWithRanks
      WHERE
        product_rank <= ${maxQuantity};
    `;
  
    return products;
  }  

  async getAll() {
    return await sql`SELECT * FROM products`
  }

}
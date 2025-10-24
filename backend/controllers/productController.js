import Product from '../models/Product.js';
import Category from '../models/Category.js';

export const getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12, featured } = req.query;

    const query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (featured === 'true') {
      query.featured = true;
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, images, stock, featured } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      images: images || [],
      stock,
      featured: featured || false
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, images, stock, featured } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price !== undefined ? price : product.price;
      product.category = category || product.category;
      product.images = images || product.images;
      product.stock = stock !== undefined ? stock : product.stock;
      product.featured = featured !== undefined ? featured : product.featured;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

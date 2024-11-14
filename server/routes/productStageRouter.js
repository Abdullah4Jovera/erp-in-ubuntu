const express = require('express');
const ProductStage = require('../models/productStageModel');
const router = express.Router();
const Product = require('../models/productModel');
const { isAuth, hasRole } = require('../utils');

// Get product stages based on pipeline_id (route param)
router.get('/pipeline/:pipelineId', async (req, res) => {
  const { pipelineId } = req.params;

  try {
    const productStages = await ProductStage.find({ pipeline_id: pipelineId, delstatus: false });

    if (!productStages.length) {
      return res.status(404).json({ error: 'No product stages found for the specified pipeline' });
    }

    res.status(200).json(productStages);
  } catch (error) {
    console.error('Error getting product stages by pipeline:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all product stages
router.get('/get-all-productstages', async (req, res) => {
  try {
    const productStages = await ProductStage.find({ delstatus: false })
   
      .populate('product_id', 'name')
      .populate('pipeline_id', 'name')
   

    res.status(200).json(productStages);
  } catch (error) {
    console.error('Error getting all product stages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all stages of a specific product
router.get('/:productId', async (req, res) => { 
  const { productId } = req.params;
  
  try {
    const productStages = await ProductStage.find({ product_id: productId, delstatus: false })
      .populate('pipeline_id', 'name');

    if (!productStages.length) {
      return res.status(404).json({ error: 'No stages found for the specified product' });
    }

    res.status(200).json(productStages);
  } catch (error) {
    console.error('Error getting product stages for product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new product stage
router.post('/create-productstages', isAuth,hasRole(['Super Admin', 'Developer']),async (req, res) => {
  const { name, product_id, pipeline_id, order } = req.body;

  try {
    const newProductStage = new ProductStage({
      name,
      product_id,
      pipeline_id, 
      order,
    });
    await newProductStage.save();
    res.status(201).json(newProductStage);
  } catch (error) {
    console.error('Error creating product stage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update an existing product stage
router.put('/:id', isAuth,hasRole(['Super Admin', 'Developer']), async (req, res) => {
  const { id } = req.params;
  const { name, product_id, pipeline_id, order } = req.body;

  try {
    const updatedProductStage = await ProductStage.findByIdAndUpdate(
      id,
      { name, product_id, pipeline_id, order },
      { new: true }
    );

    if (!updatedProductStage) {
      return res.status(404).json({ error: 'Product stage not found' });
    }

    res.status(200).json(updatedProductStage);
  } catch (error) {
    console.error('Error updating product stage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Soft delete a product stage
router.delete('/:id', isAuth,hasRole(['Super Admin', 'Developer']), async (req, res) => {
  const { id } = req.params;

  try {
    const updatedProductStage = await ProductStage.findByIdAndUpdate(
      id,
      { delstatus: true }, // Set delstatus to true instead of deleting
      { new: true }
    );

    if (!updatedProductStage) {
      return res.status(404).json({ error: 'Product stage not found' });
    }

    res.status(200).json({ message: 'Product stage soft deleted successfully' });
  } catch (error) {
    console.error('Error soft deleting product stage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

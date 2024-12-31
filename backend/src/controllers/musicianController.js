import Musician from '../models/musicianModel.js';
import Artist from '../models/artistModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleResponse, handleError } from '../utils/responseHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAllMusicians = async (req, res) => {
  try {
    const musicians = await Musician.findAll();
    const musiciansWithFile = musicians.map((musician) => ({
      ...musician.toJSON(),
      file: musician.file || null,
    }));

    handleResponse(res, 200, 'Musicians retrieved successfully', musiciansWithFile);
  } catch (error) {
    handleError(res, error);
  }
};

export const getMusicianById = async (req, res) => {
  try {
    const { id } = req.params;
    const musician = await Musician.findByPk(id, {
      include: [{
        model: Artist,
        attributes: ['id', 'name']
      }]
    });

    if (!musician) {
      return handleResponse(res, 404, 'Musician not found');
    }

    handleResponse(res, 200, 'Musician retrieved successfully', musician);
  } catch (error) {
    handleError(res, error);
  }
};

export const getMusiciansByArtist = async (req, res) => {
  try {
    const { artistId } = req.params;
    const musicians = await Musician.findAll({
      where: { artist_id: artistId }
    });

    handleResponse(res, 200, 'Musicians retrieved successfully', musicians);
  } catch (error) {
    handleError(res, error);
  }
};

export const createMusician = async (req, res) => {
  try {
    const { name, role, email, artist_id } = req.body;
    const file = req.file ? req.file.filename : null;

    const newMusician = await Musician.create({
      name,
      role,
      email,
      artist_id,
      file,
    });

    handleResponse(res, 201, 'Musician created successfully', newMusician);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateMusician = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, email, artist_id } = req.body;
    const file = req.file ? req.file.filename : null;

    const musician = await Musician.findByPk(id);
    if (!musician) {
      return handleResponse(res, 404, 'Musician not found');
    }

    // If there's a new file and an existing file, delete the old one
    if (file && musician.file) {
      const oldFilePath = path.join(__dirname, '../../uploads', musician.file);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    await musician.update({
      name: name || musician.name,
      role: role || musician.role,
      email: email || musician.email,
      artist_id: artist_id || musician.artist_id,
      file: file || musician.file,
    });

    handleResponse(res, 200, 'Musician updated successfully', musician);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteMusician = async (req, res) => {
  try {
    const { id } = req.params;
    const musician = await Musician.findByPk(id);

    if (!musician) {
      return handleResponse(res, 404, 'Musician not found');
    }

    // Delete associated file if it exists
    if (musician.file) {
      const filePath = path.join(__dirname, '../../uploads', musician.file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await musician.destroy();
    handleResponse(res, 200, 'Musician deleted successfully');
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteMusicianImage = async (req, res) => {
  try {
    const { id } = req.params;
    const musician = await Musician.findByPk(id);

    if (!musician) {
      return handleResponse(res, 404, 'Musician not found');
    }

    if (!musician.file) {
      return handleResponse(res, 404, 'No image found for this musician');
    }

    const filePath = path.join(__dirname, '../../uploads', musician.file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await musician.update({ file: null });
    handleResponse(res, 200, 'Musician image deleted successfully');
  } catch (error) {
    handleError(res, error);
  }
};
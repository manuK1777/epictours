import Crew from '../models/crewModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleResponse, handleError } from '../utils/responseHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAllCrewMembers = async (req, res) => {
  try {
    const crewMembers = await Crew.findAll();
    const crewMembersWithFile = crewMembers.map((crew) => ({
      ...crew.toJSON(),
      file: crew.file || null,
    }));

    handleResponse(res, 200, 'Crew members retrieved successfully', crewMembersWithFile);
  } catch (error) {
    handleError(res, error);
  }
};

export const getCrewMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const crewMember = await Crew.findByPk(id);
    if (!crewMember) {
      return handleResponse(res, 404, 'Crew member not found');
    }

    handleResponse(res, 200, 'Crew member retrieved successfully', crewMember);
  } catch (error) {
    handleError(res, error);
  }
};

export const createCrewMember = async (req, res) => {
  try {
    const { name, role, email, phone, artist_id } = req.body;
    const file = req.file ? req.file.filename : null;

    // Only include fields that are provided and not empty
    const crewData = {
      name,  // Required
      artist_id,  // Required
      role: role || null,  // Convert empty string to null
      email: email || null,  // Convert empty string to null
      phone: phone || null,  // Convert empty string to null
      ...(file && { file })
    };

    const newCrewMember = await Crew.create(crewData);

    handleResponse(res, 201, 'Crew member created successfully', newCrewMember);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateCrewMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, email, phone, artist_id } = req.body;
    const file = req.file ? req.file.filename : null;

    const crewMember = await Crew.findByPk(id);
    if (!crewMember) {
      return handleResponse(res, 404, 'Crew member not found');
    }

    // If there's a new file and an existing file, delete the old one
    if (file && crewMember.file) {
      const oldFilePath = path.join(__dirname, '../../uploads', crewMember.file);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Only update fields that are provided
    const updates = {
      ...(name && { name }),
      ...(role && { role }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(artist_id && { artist_id }),
      ...(file && { file })
    };

    await crewMember.update(updates);

    handleResponse(res, 200, 'Crew member updated successfully', crewMember);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteCrewMember = async (req, res) => {
  try {
    const { id } = req.params;
    const crewMember = await Crew.findByPk(id);

    if (!crewMember) {
      return handleResponse(res, 404, 'Crew member not found');
    }

    // Delete associated file if it exists
    if (crewMember.file) {
      const filePath = path.join(__dirname, '../../uploads', crewMember.file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await crewMember.destroy();

    handleResponse(res, 200, 'Crew member deleted successfully');
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteCrewMemberImage = async (req, res) => {
  try {
    const { id } = req.params;
    const crewMember = await Crew.findByPk(id);

    if (!crewMember) {
      return handleResponse(res, 404, 'Crew member not found');
    }

    if (!crewMember.file) {
      return handleResponse(res, 404, 'No image found for this crew member');
    }

    const filePath = path.join(__dirname, '../../uploads', crewMember.file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await crewMember.update({ file: null });

    handleResponse(res, 200, 'Crew member image deleted successfully');
  } catch (error) {
    handleError(res, error);
  }
};

export const getCrewMembersByArtist = async (req, res) => {
  try {
    const { artistId } = req.params;
    const crewMembers = await Crew.findAll({
      where: { artist_id: artistId }
    });

    handleResponse(res, 200, 'Crew members retrieved successfully', crewMembers);
  } catch (error) {
    handleError(res, error);
  }
};
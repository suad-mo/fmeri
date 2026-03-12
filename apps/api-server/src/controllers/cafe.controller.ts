import { Request, Response } from 'express';
import { Table } from '@nx-fmeri/api-cafe';
import { getErrorMessage } from '../helpers/error.helper';

export const getAllTables = async (_req: Request, res: Response) => {
  try {
    const tables = await Table.find();
    return res.json(tables);
  } catch (error: unknown) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};

export const updateTablePosition = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { positionX, positionY } = req.body;

    const updatedTable = await Table.findByIdAndUpdate(
      id,
      { positionX, positionY },
      { new: true } // Vrati nam ažuriran dokument
    );

    if (!updatedTable) {
      return res.status(404).json({ message: 'Stol nije pronađen' });
    }

    return res.json(updatedTable);
  } catch (error: unknown) {
    // return res.status(400).json({ message: 'Greška pri ažuriranju pozicije' });
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};

export const createTable = async (req: Request, res: Response) => {
  try {
    const newTable = new Table(req.body);
    await newTable.save();
    return res.status(201).json(newTable);
  } catch (error: unknown) {
    return res.status(400).json({ error: getErrorMessage(error) });
  }
};

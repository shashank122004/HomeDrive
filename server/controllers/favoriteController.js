import * as Favorite from '../models/favoriteModel.js';

export async function listFavorites(req, res, next) {
  try {
    const files = await Favorite.getFavorites(req.user.id);
    res.json({ files });
  } catch (err) {
    next(err);
  }
}

export async function addFavorite(req, res, next) {
  try {
    await Favorite.addFavorite(req.user.id, req.params.id);
    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function removeFavorite(req, res, next) {
  try {
    await Favorite.removeFavorite(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  return "hotels";
}

export async function getHotelsById(req: AuthenticatedRequest, res: Response) {
  return "hotelsId";
}

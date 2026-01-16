import type { ApiResponse } from "../types/index.js";
import type { Response } from "express";

export const errorResponse = (
  res: Response,
  error: string,
  statusCode: number
) => {
  const response: ApiResponse = {
    success : false,
    error,
  };
  return res.status(statusCode).json(response);
};

export const successResponse = <T>(res : Response , statusCode : number , data : T ) => {
    const response : ApiResponse<T> = {
        success : true,
        data,
    } // T is the typed response that it will be filled/infer by the TS on its own
    return res.status(statusCode).json(response)
}

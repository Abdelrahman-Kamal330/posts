import axios from "axios";
import api from "../api.tsx";

// Mock axios
jest.mock("axios", () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  })),
}));

describe("API Utility", () => {
  it("creates an axios instance with the correct base URL", () => {
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "http://localhost:5000",
    });
  });

  it("exports the axios instance", () => {
    expect(api).toBeDefined();
    expect(api.get).toBeDefined();
    expect(api.post).toBeDefined();
    expect(api.put).toBeDefined();
    expect(api.delete).toBeDefined();
  });
});

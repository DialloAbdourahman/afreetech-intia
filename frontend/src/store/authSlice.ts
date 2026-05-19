import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { login as loginRequest, getMe } from "../services/auth.service";
import type { AdminDto } from "../types/auth";
import type { RootState } from "./index";

const TOKEN_KEY = "auth_token";

function loadToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function saveToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export interface AuthState {
  token: string | null;
  admin: AdminDto | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  token: loadToken(),
  admin: null,
  status: "idle",
  error: null,
};

export const login = createAsyncThunk<
  { token: string; admin: AdminDto },
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async (credentials, thunkAPI) => {
  try {
    const result = await loginRequest(credentials);

    if (result.code !== "SUCCESS" || !result.data) {
      return thunkAPI.rejectWithValue(result.message || "Login failed");
    }

    const { accessToken, admin } = result.data;

    if (!accessToken) {
      return thunkAPI.rejectWithValue("No access token returned by server");
    }

    saveToken(accessToken);

    return {
      token: accessToken,
      admin,
    };
  } catch (error: any) {
    const message: string = error?.payload?.message || error?.message || "Login failed";
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchCurrentAdmin = createAsyncThunk<
  { admin: AdminDto },
  void,
  { state: RootState; rejectValue: string }
>("auth/fetchCurrentAdmin", async (_, thunkAPI) => {
  const state = thunkAPI.getState();
  const token = state.auth.token;

  if (!token) {
    return thunkAPI.rejectWithValue("No token available");
  }

  try {
    const result = await getMe(token);

    if (result.code !== "SUCCESS" || !result.data) {
      return thunkAPI.rejectWithValue(result.message || "Failed to load admin info");
    }

    return {
      admin: result.data,
    };
  } catch (error: any) {
    const message: string = error?.payload?.message || error?.message || "Failed to load admin info";
    return thunkAPI.rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.admin = null;
      saveToken(null);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ token: string; admin: AdminDto }>) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.admin = action.payload.admin;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || action.error.message || null;
      })
      .addCase(fetchCurrentAdmin.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCurrentAdmin.fulfilled, (state, action: PayloadAction<{ admin: AdminDto }>) => {
        state.status = "succeeded";
        state.admin = action.payload.admin;
      })
      .addCase(fetchCurrentAdmin.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || action.error.message || null;
        state.token = null;
        state.admin = null;
        saveToken(null);
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;

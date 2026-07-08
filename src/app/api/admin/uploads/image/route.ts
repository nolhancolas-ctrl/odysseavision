import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { uploadImageCore } from "@/lib/admin/uploadImageCore";

const methodNotAllowedResponse = {
  ok: false,
  error: "Method not allowed. Use POST with multipart/form-data.",
  path: "",
};

export async function GET() {
  return NextResponse.json(methodNotAllowedResponse, { status: 405 });
}

export async function POST(request: Request) {
  try {
    const authenticated = await isAdminAuthenticated();

    if (!authenticated) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unauthorized.",
          path: "",
        },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const result = await uploadImageCore(formData);

    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[admin upload api] Upload request failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Upload request failed.",
        path: "",
      },
      { status: 500 },
    );
  }
}

import { readProductImage } from "@/lib/uploads";

// الصور تعيش في حجم البيانات لا في public — تُقدَّم من هنا.
export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;

  const file = await readProductImage(name);
  if (!file) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.mime,
      // الاسم مشتق من محتوى مرفوع مرة واحدة ولا يتغيّر
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(file.bytes.byteLength),
      "X-Content-Type-Options": "nosniff",
    },
  });
}

import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export default {
  fetch: withSupabase(
    { auth: ["publishable", "secret"] },
    async (req: Request, ctx) => {
      try {
        const { id } = await req.json();

        if (!id) {
          return Response.json(
            {
              sucesso: false,
              mensagem: "ID do usuário é obrigatório.",
            },
            { status: 400 }
          );
        }

        // Exclui do Authentication
        const { error: authError } =
          await ctx.supabaseAdmin.auth.admin.deleteUser(id);

        if (authError) {
          return Response.json(
            {
              sucesso: false,
              mensagem: authError.message,
            },
            { status: 400 }
          );
        }

        // Exclui da tabela usuarios
        const { error: dbError } = await ctx.supabaseAdmin
          .from("usuarios")
          .delete()
          .eq("id", id);

        if (dbError) {
          return Response.json(
            {
              sucesso: false,
              mensagem: dbError.message,
            },
            { status: 400 }
          );
        }

        return Response.json({
          sucesso: true,
          mensagem: "Usuário excluído com sucesso.",
        });
      } catch (error) {
        return Response.json(
          {
            sucesso: false,
            mensagem:
              error instanceof Error
                ? error.message
                : "Erro interno do servidor.",
          },
          { status: 500 }
        );
      }
    }
  ),
};
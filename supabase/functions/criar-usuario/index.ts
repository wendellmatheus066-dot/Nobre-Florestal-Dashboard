import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export default {
  fetch: withSupabase(
    { auth: ["publishable", "secret"] },
    async (req: Request, ctx) => {
      try {
        const {
          nome,
          email,
          senha,
          perfil,
          ativo,
        } = await req.json();

        if (!nome || !email || !senha) {
          return Response.json(
            {
              sucesso: false,
              mensagem: "Nome, e-mail e senha são obrigatórios.",
            },
            { status: 400 }
          );
        }

        const { data: authUser, error: authError } =
          await ctx.supabaseAdmin.auth.admin.createUser({
            email,
            password: senha,
            email_confirm: true,
          });

        if (authError) {
          return Response.json(
            {
              sucesso: false,
              mensagem: authError.message,
            },
            { status: 400 }
          );
        }

        if (!authUser.user) {
          return Response.json(
            {
              sucesso: false,
              mensagem: "Não foi possível criar o usuário.",
            },
            { status: 500 }
          );
        }
                const { error: dbError } = await ctx.supabaseAdmin
          .from("usuarios")
          .insert({
            id: authUser.user.id,
            nome,
            email,
            perfil: perfil ?? "usuario",
            ativo: ativo ?? true,
          });

        if (dbError) {
          await ctx.supabaseAdmin.auth.admin.deleteUser(
            authUser.user.id
          );

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
          mensagem: "Usuário criado com sucesso.",
          usuario: {
            id: authUser.user.id,
            nome,
            email,
            perfil: perfil ?? "usuario",
            ativo: ativo ?? true,
          },
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
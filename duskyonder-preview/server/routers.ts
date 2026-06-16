import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getAllThemeConfigs, setThemeConfig, getAllUploadedImages, upsertUploadedImage } from "./db";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Theme configuration
  theme: router({
    getAll: publicProcedure.query(async () => {
      const configs = await getAllThemeConfigs();
      const images = await getAllUploadedImages();
      return { configs, images };
    }),

    setConfig: publicProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(async ({ input }) => {
        await setThemeConfig(input.key, input.value);
        return { success: true };
      }),

    uploadImage: publicProcedure
      .input(z.object({
        section: z.string(),
        slot: z.string(),
        base64: z.string(),
        mimeType: z.string(),
        originalName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Decode base64 to buffer
        const base64Data = input.base64.replace(/^data:[^;]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const ext = input.mimeType.split('/')[1] || 'jpg';
        const key = `duskyonder/${input.section}/${input.slot}-${Date.now()}.${ext}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await upsertUploadedImage({
          section: input.section,
          slot: input.slot,
          s3Key: key,
          url,
          originalName: input.originalName,
        });
        return { url, key };
      }),
  }),
});

export type AppRouter = typeof appRouter;

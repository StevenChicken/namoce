import { z } from 'zod'

export const changeUserTypeSchema = z.object({
  userId: z.string().uuid('ID utente non valido'),
  userType: z.enum(['utente', 'volontario'], {
    message: 'Tipo utente non valido',
  }),
})

export const changeAdminLevelSchema = z.object({
  userId: z.string().uuid('ID utente non valido'),
  adminLevel: z.enum(['none', 'admin', 'super_admin'], {
    message: 'Livello admin non valido',
  }),
})

export const updateClownNameSchema = z.object({
  userId: z.string().uuid('ID utente non valido'),
  clownName: z.string().min(1, 'Il nome clown è obbligatorio').max(100, 'Il nome clown è troppo lungo'),
})

export const assignCategoryPermissionSchema = z.object({
  userId: z.string().uuid('ID utente non valido'),
  category: z.string().min(1, 'La categoria è obbligatoria'),
})

export const removeCategoryPermissionSchema = z.object({
  userId: z.string().uuid('ID utente non valido'),
  category: z.string().min(1, 'La categoria è obbligatoria'),
})

export type ChangeUserTypeData = z.infer<typeof changeUserTypeSchema>
export type ChangeAdminLevelData = z.infer<typeof changeAdminLevelSchema>
export type UpdateClownNameData = z.infer<typeof updateClownNameSchema>
export type AssignCategoryPermissionData = z.infer<typeof assignCategoryPermissionSchema>
export type RemoveCategoryPermissionData = z.infer<typeof removeCategoryPermissionSchema>

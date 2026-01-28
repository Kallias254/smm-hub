import { CollectionBeforeValidateHook } from 'payload'

/**
 * ENFORCE SEAT LIMITS HOOK
 * 
 * Before a user is saved, we check if adding them to their selected
 * tenants would exceed the seat limit for those agencies.
 */
export const enforceSeatLimits: CollectionBeforeValidateHook = async ({
  data,
  req,
  operation,
}) => {
  // Only check if tenants are being modified
  if (!data?.tenants || !Array.isArray(data.tenants)) return data

  const { payload } = req
  const newTenantIds = data.tenants.map((t: any) => typeof t === 'object' ? t.id : t)

  for (const tenantId of newTenantIds) {
    // 1. Fetch the Tenant to get its limit
    const tenant = await payload.findByID({
      collection: 'tenants',
      id: tenantId,
    })

    const limit = (tenant as any).billing?.seatLimit || 5

    // 2. Count existing users for this tenant
    const usersWithThisTenant = await payload.find({
      collection: 'users',
      where: {
        tenants: {
          contains: tenantId,
        },
      },
      limit: 0,
    })

    let currentCount = usersWithThisTenant.totalDocs
    
    // 3. Robust Check: If this is an update, check if user was already in the tenant
    const isNewToTenant = operation === 'create' || 
      !req.user?.tenants?.some((t: any) => (typeof t === 'object' ? t.id : t) === tenantId)

    if (isNewToTenant && currentCount >= limit) {
       throw new Error(`Seat limit reached for ${tenant.name}. This agency is limited to ${limit} seats.`)
    }
  }

  return data
}

export function toUiUser(apiUser) {
  if (!apiUser) return null;

  const userId = apiUser.userId ?? apiUser.user_id ?? apiUser.id ?? null;
  const firstName = apiUser.firstName ?? apiUser.first_name ?? "";
  const lastName = apiUser.lastName ?? apiUser.last_name ?? "";
  const email = apiUser.email ?? apiUser.username ?? "";
  const phoneNumber = apiUser.phoneNumber ?? apiUser.phone_number ?? "";
  const teamId =
    apiUser.teamId ??
    apiUser.team_id ??
    apiUser.team?.teamId ??
    apiUser.team?.team_id ??
    apiUser.team?.id ??
    null;
  const role = apiUser.role ?? "";

  return {
    userId,
    firstName,
    lastName,
    email,
    phoneNumber,
    teamId,
    role,

    // keep a copy for pages that still expect snake_case
    user_id: userId,
    first_name: firstName,
    last_name: lastName,
    phone_number: phoneNumber,
    team_id: teamId,

    _raw: apiUser
  };
}

export function toApiUserPayload(uiOrPartial) {
  if (!uiOrPartial) return {};

  const firstName = uiOrPartial.firstName ?? uiOrPartial.first_name;
  const lastName = uiOrPartial.lastName ?? uiOrPartial.last_name;
  const email = uiOrPartial.email;
  const phoneNumber = uiOrPartial.phoneNumber ?? uiOrPartial.phone_number;
  const teamId = uiOrPartial.teamId ?? uiOrPartial.team_id;
  const role = uiOrPartial.role;
  const password = uiOrPartial.password;

  return {
    ...(firstName !== undefined ? { first_name: firstName } : {}),
    ...(lastName !== undefined ? { last_name: lastName } : {}),
    ...(email !== undefined ? { email } : {}),
    ...(phoneNumber !== undefined ? { phone_number: phoneNumber } : {}),
    ...(teamId !== undefined ? { team_id: teamId } : {}),
    ...(role !== undefined ? { role } : {}),
    ...(password !== undefined ? { password } : {})
  };
}

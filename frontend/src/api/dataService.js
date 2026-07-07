/**
 * dataService.js
 *
 * Development: the map page reads live data from the local WanluanDmapApi
 * backend (dotnet run) so changes made on the /manage page show up
 * immediately. create/update/remove also call the backend.
 *
 * Production: reads the static roadHazards.json bundled with the build
 * (public/data/roadHazards.json -> dist/data/roadHazards.json), no API call,
 * because GitHub Pages is static and has no backend.
 */

// Dev-only calls go through the Vite dev proxy (vite.config.mjs maps /api ->
// http://localhost:5180). Using a relative path keeps every request same-origin,
// so there is no CORS to configure and it keeps working even if Vite picks a
// different port (e.g. 3456 when 3455 is taken).

function unwrap (apiResult) {
  // Backend serializes ApiResult<T> with the default ASP.NET Core camelCase policy.
  if (!apiResult.succ) {
    throw new Error(apiResult.message || 'API error')
  }
  return apiResult.data
}

export async function fetchHazards () {
  // In development the backend is the source of truth so the map reflects
  // edits made on the /manage page. This branch is dropped from the
  // production build (import.meta.env.DEV is statically false there).
  if (import.meta.env.DEV) {
    return fetchHazardsFromApi()
  }

  const response = await fetch(`${import.meta.env.BASE_URL}data/roadHazards.json`, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Failed to load road hazards: ${response.status}`)
  }
  return response.json()
}

export async function createHazard (payload) {
  const response = await fetch('/api/RoadHazard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return unwrap(await response.json())
}

export async function updateHazard (id, payload) {
  const response = await fetch(`/api/RoadHazard/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return unwrap(await response.json())
}

export async function removeHazard (id) {
  const response = await fetch(`/api/RoadHazard/${id}`, {
    method: 'DELETE',
  })
  return unwrap(await response.json())
}

export async function uploadPhoto (file) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch('/api/Photo', {
    method: 'POST',
    body: formData,
  })
  return unwrap(await response.json())
}

export async function fetchHazardsFromApi () {
  let response
  try {
    response = await fetch('/api/RoadHazard')
  } catch {
    // A network error here almost always means the local backend isn't running.
    throw new Error('無法連線到本機後端，請先啟動後端（cd backend && dotnet run）。')
  }
  return unwrap(await response.json())
}

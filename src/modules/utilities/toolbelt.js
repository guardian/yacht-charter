export function getJson(url) {
  return fetch(`${url}?t=${new Date().getTime()}`).then(r => r.json())
}

export function getTemplate(path) {
return fetch(`${path}?t=${new Date().getTime()}`).then(r => r.text())
}
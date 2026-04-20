export const generateSlug = (name) => {
  return name
    .toLowerCase() // "Guitarras Elétricas"  → "guitarras elétricas"
    .normalize("NFD") // separa letra + acento  → "guitarras ele\u0301tricas"
    .replace(/[\u0300-\u036f]/g, "") // remove os acentos      → "guitarras eletricas"
    .replace(/[^a-z0-9\s-]/g, "") // remove caracteres especiais
    .trim() // remove espaços nas pontas
    .replace(/\s+/g, "-"); // espaços viram hífen    → "guitarras-eletricas"
};

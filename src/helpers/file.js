const getKeyFromFileName = (fileName) => {
  return fileName && fileName.length > 8 ? fileName.substr(0, 8) : null;
};

export { getKeyFromFileName };

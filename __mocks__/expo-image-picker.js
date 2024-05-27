export const MediaTypeOptions = {
  All: 'All',
  Videos: 'Videos',
  Images: 'Images',
};

export const launchImageLibraryAsync = jest.fn(async () => ({
  cancelled: false,
  assets: [{ uri: 'mockUri', type: 'image' }],
}));

import { find, findOne, dataStore } from 'graphql-markdown';

/**
 * Convert our gql OrderBy enum into a format that nedb can understand.
 * @param {string} orderBy - It can be "ASCENDING" or "DESCENDING".
 * @returns {number} Order to sort the results in our query for nedb.
 */
export const convertOrderBy = orderBy => {
  if (orderBy === 'DESCENDING') {
    return -1;
  }
  return 1;
};

/**
 * Create a ContentItem conforming to our gql schema typeDef.
 * @param {Object} params
 * @returns {Object} A ContentItem matching the gql schema typeDef/
 */
export const mapContentItems = ({
  _id,
  markdown,
  assetDir,
  images,
  ...fields
}) => fields;

/**
 * Retrieves the specified ContentItem by it's id.
 * @param {string} id - The id of the ContentItem
 * @returns {Object|null} returns the ContentItem or null on error.
 */
export const findContentItemById = async id => {
  // Don't even bother if we didn't get an ID
  if (id) {
    try {
      const contentItem = await findOne({
        db: dataStore,
        query: { id },
        mapFunc: mapContentItems,
      });

      return contentItem;
    } catch (error) {
      console.error('[getContentItem]', error); // eslint-disable-line no-console
    }
  }
  return null;
};


export const findContentItemsByGroupId = async ({
  groupId,
  pagination: { sort = null, skip = 0, limit = 0 } = {},
}) => {
  // We do not allow returning every ContentItem
  if (!groupId) {
    throw new Error('[findByGroupId]: You must provide a groupId.');
  }
  try {
    const query = { groupId };

    const sortOptions = sort
      ? { [sort.sortBy]: convertOrderBy(sort.orderBy) }
      : null;

    const contentItems = await find({
      db: dataStore,
      query,
      sortOptions,
      skip,
      limit,
      mapFunc: mapContentItems,
    });

    return contentItems;
  } catch (error) {
    // TODO: Should we throw or only log?
    console.error('[getContentItemsByGroupId] -> ', error); // eslint-disable-line no-console
  }
  // NOTE: Should we do a throw in the error above instead of empty array?
  return [];
};

export const findContentItemsByFilter = async ({
  filter: { AND = {}, OR = [] } = {},
  pagination: { sort = null, skip = 0, limit = 0 } = {},
}) => {
  // NOTE: Currently do no support querying with AND + OR
  // TODO: Throw error if try to filter with AND & OR
  const isAndEmpty = !Object.keys(AND).length;

  // Only allowed to find ContentItems if fields have been provided
  if (!OR.length && isAndEmpty) {
    throw new Error(
      '[findContentItemsByFilter]: You must provide at least one field to filter on.',
    );
  }

  try {
    const query = !isAndEmpty ? AND : { $or: OR };

    const sortOptions = sort
      ? { [sort.sortBy]: convertOrderBy(sort.orderBy) }
      : null;

    const contentItems = await find({
      db: dataStore,
      query,
      sortOptions,
      skip,
      limit,
      mapFunc: mapContentItems,
    });
    return contentItems;
  } catch (error) {
    console.error('[getContentItems] -> ', error); // eslint-disable-line no-console
  }
  return [];
};

// Property data for the screens. Every function is async and takes the property
// id, so real address search and data sources can replace the mock below without
// changing how screens ask for data.
import { mockProperties } from './mockPropertyData';

export const DEFAULT_PROPERTY_ID = 'voorbeeldlaan-73b';

const findProperty = (propertyId) => {
  const property = mockProperties[propertyId];
  if (!property) throw new Error('Onbekende woning');
  return property;
};

const requireSession = (session) => {
  if (!session) throw new Error('Niet ingelogd');
};

// Copies, so a screen can never change the source data.
const copy = (value) => structuredClone(value);

export const getPublicProperty = async (propertyId) => copy(findProperty(propertyId).publicInfo);

export const getPersonalProperty = async (propertyId, session) => {
  const property = findProperty(propertyId);
  requireSession(session);
  return copy(property.personalizedInfo);
};

export const getBuildingData = async (propertyId, session) => {
  const property = findProperty(propertyId);
  requireSession(session);
  return copy(property.buildingData);
};

export const getContractors = async (propertyId) => copy(findProperty(propertyId).contractors);

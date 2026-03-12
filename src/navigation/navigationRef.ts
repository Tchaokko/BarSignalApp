import { createNavigationContainerRef } from '@react-navigation/native';

// Typed as any so the ref can be used from outside the navigation tree
// without requiring a specific param list.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const navigationRef = createNavigationContainerRef<any>();

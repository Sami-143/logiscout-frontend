"use client"

/**
 * Redux Store Provider
 * Wraps the app with Redux Provider
 */

import { Provider } from "react-redux"
import { store } from "./store"

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>
}

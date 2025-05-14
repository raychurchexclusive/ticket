"use client"

import { useState, useEffect } from "react"
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  type Query,
  type DocumentData,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

// Hook for a single document
export function useRealtimeDocument<T = DocumentData>(collectionName: string, documentId: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!documentId) {
      setData(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const docRef = doc(db, collectionName, documentId)

    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() } as T)
        } else {
          setData(null)
        }
        setLoading(false)
      },
      (err) => {
        console.error(`Error getting document from ${collectionName}:`, err)
        setError(err)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [collectionName, documentId])

  return { data, loading, error }
}

// Hook for a collection with query
export function useRealtimeCollection<T = DocumentData>(
  collectionName: string,
  queryConstraints: {
    where?: [string, "==" | "!=" | ">" | ">=" | "<" | "<=", any][]
    orderBy?: [string, "asc" | "desc"][]
    limit?: number
  } = {},
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    let q: Query = collection(db, collectionName)

    // Apply where clauses
    if (queryConstraints.where) {
      queryConstraints.where.forEach((constraint) => {
        q = query(q, where(constraint[0], constraint[1], constraint[2]))
      })
    }

    // Apply orderBy clauses
    if (queryConstraints.orderBy) {
      queryConstraints.orderBy.forEach((constraint) => {
        q = query(q, orderBy(constraint[0], constraint[1]))
      })
    }

    // Apply limit
    if (queryConstraints.limit) {
      q = query(q, limit(queryConstraints.limit))
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const documents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T)
        setData(documents)
        setLoading(false)
      },
      (err) => {
        console.error(`Error getting collection ${collectionName}:`, err)
        setError(err)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [collectionName, JSON.stringify(queryConstraints)])

  return { data, loading, error }
}

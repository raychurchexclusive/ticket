"use client"

import { useState, useEffect } from "react"
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  type WhereFilterOp,
  type DocumentData,
  type QueryConstraint,
  doc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

type WhereClause = [string, WhereFilterOp, any]
type OrderByClause = [string, ("asc" | "desc")?]

interface QueryOptions {
  where?: WhereClause[]
  orderBy?: OrderByClause[]
  limit?: number
}

export function useRealtimeCollection<T = DocumentData>(collectionName: string, options: QueryOptions = {}) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const constraints: QueryConstraint[] = []

    // Add where clauses
    if (options.where) {
      options.where.forEach((whereClause) => {
        if (whereClause[2] !== undefined && whereClause[2] !== "") {
          constraints.push(where(whereClause[0], whereClause[1], whereClause[2]))
        }
      })
    }

    // Add orderBy clauses
    if (options.orderBy) {
      options.orderBy.forEach((orderByClause) => {
        constraints.push(orderBy(orderByClause[0], orderByClause[1] || "asc"))
      })
    }

    // Add limit
    if (options.limit) {
      constraints.push(limit(options.limit))
    }

    const q = query(collection(db, collectionName), ...constraints)

    setLoading(true)
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const documents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[]
        setData(documents)
        setLoading(false)
      },
      (err) => {
        console.error(`Error fetching ${collectionName}:`, err)
        setError(err)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [collectionName, JSON.stringify(options)])

  return { data, loading, error }
}

export function useRealtimeDocument<T = DocumentData>(collectionName: string, documentId: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!documentId) {
      setData(null)
      setLoading(false)
      return () => {}
    }

    setLoading(true)
    const docRef = doc(db, collectionName, documentId)
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T)
        } else {
          setData(null)
        }
        setLoading(false)
      },
      (err) => {
        console.error(`Error fetching document ${documentId}:`, err)
        setError(err)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [collectionName, documentId])

  return { data, loading, error }
}

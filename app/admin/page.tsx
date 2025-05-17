"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <Card className="w-full max-w-lg shadow-lg">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center">Admin Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-lg mt-4 mb-2">
                        Welcome, Admin!<br />
                        You have access to the admin dashboard.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
} 
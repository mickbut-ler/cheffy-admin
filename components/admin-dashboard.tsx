"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Search,
    RefreshCw,
    Eye,
    MessageSquare,
    Activity,
    Database,
    Users,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import type { RecipeProcessingRun } from "@/lib/supabase"

interface PaginationInfo {
    page: number
    limit: number
    total: number
    totalPages: number
}

interface RunsResponse {
    data: RecipeProcessingRun[]
    pagination: PaginationInfo
}

function getStatusBadge(status: string) {
    const variants = {
        completed: "bg-green-100 text-green-800 border-green-200",
        processing: "bg-blue-100 text-blue-800 border-blue-200",
        pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        failed: "bg-red-100 text-red-800 border-red-200",
    }

    return (
        <Badge className={variants[status as keyof typeof variants] || variants.pending}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    )
}

function formatDate(dateString: string | null) {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleString()
}

export function AdminDashboard() {
    const [runs, setRuns] = useState<RecipeProcessingRun[]>([])
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 100,
        total: 0,
        totalPages: 0,
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedRun, setSelectedRun] = useState<RecipeProcessingRun | null>(null)
    const [feedback, setFeedback] = useState("")

    const fetchRuns = async (page = 1) => {
        try {
            setLoading(true)
            setError(null)
            const response = await fetch(`/api/runs?page=${page}`)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result: RunsResponse = await response.json()
            setRuns(result.data)
            setPagination(result.pagination)
        } catch (err) {
            console.error("Failed to fetch runs:", err)
            setError(err instanceof Error ? err.message : "Failed to fetch data")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRuns(pagination.page)
    }, [])

    const filteredRuns = runs.filter(
        (run) =>
            run.phone_number?.includes(searchTerm) ||
            run.platform?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            run.url?.includes(searchTerm) ||
            run.status?.includes(searchTerm),
    )

    const stats = {
        total: pagination.total,
        completed: runs.filter((r) => r.status === "succes").length,
        error: runs.filter((r) => r.status === "error").length,
        invalid_recipe: runs.filter((r) => r.status === "invalid_recipe").length,
        insufficient_credits: runs.filter((r) => r.status === "insufficient_credits").length,
    }

    const handleFeedbackSubmit = () => {
        if (selectedRun && feedback.trim()) {
            setRuns((prev) => prev.map((run) => (run.id === selectedRun.id ? { ...run, feedback: feedback.trim() } : run)))
            setFeedback("")
            setSelectedRun(null)
        }
    }

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination((prev) => ({ ...prev, page: newPage }))
            fetchRuns(newPage)
        }
    }

    const handleRefresh = () => {
        fetchRuns(pagination.page)
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card">
                <div className="flex h-16 items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        <Database className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-semibold text-foreground">Recipe Processing Admin</h1>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>
            </header>

            <div className="p-6 space-y-6">
                {error && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <p className="text-red-600">Error: {error}</p>
                            <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2 bg-transparent">
                                Try Again
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Runs</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Error</CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.error}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Invalid recipe</CardTitle>
                            <Activity className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.invalid_recipe}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Insufficient credits</CardTitle>
                            <Activity className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.insufficient_credits}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-foreground">Recipe Processing Runs</CardTitle>
                                <CardDescription>
                                    Monitor and manage all recipe processing activities
                                    {pagination.total > 0 && (
                                        <span className="ml-2">
                                            (Page {pagination.page} of {pagination.totalPages}, {pagination.total} total)
                                        </span>
                                    )}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search runs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 w-64"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                                <span className="ml-2 text-muted-foreground">Loading runs...</span>
                            </div>
                        ) : (
                            <>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>ID</TableHead>
                                                <TableHead>Phone Number</TableHead>
                                                <TableHead>Platform</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Created</TableHead>
                                                <TableHead>Recipe id</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredRuns.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                        {searchTerm ? "No runs match your search." : "No runs found."}
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredRuns.map((run) => (
                                                    <TableRow key={run.id}>
                                                        <TableCell className="font-mono text-sm">{run.id}</TableCell>
                                                        <TableCell className="font-mono">{run.phone_number}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{run.platform}</Badge>
                                                        </TableCell>
                                                        <TableCell>{getStatusBadge(run.status)}</TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {formatDate(run.created_at)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {run.recipe_id}

                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <Button variant="outline" size="sm">
                                                                            <Eye className="h-4 w-4" />
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="max-w-2xl">
                                                                        <DialogHeader>
                                                                            <DialogTitle>Run Details - #{run.id}</DialogTitle>
                                                                            <DialogDescription>
                                                                                Complete information for this processing run
                                                                            </DialogDescription>
                                                                        </DialogHeader>
                                                                        <div className="grid grid-cols-2 gap-4 py-4">
                                                                            <div>
                                                                                <Label className="text-sm font-medium">Phone Number</Label>
                                                                                <p className="text-sm text-muted-foreground font-mono">{run.phone_number}</p>
                                                                            </div>
                                                                            <div>
                                                                                <Label className="text-sm font-medium">Platform</Label>
                                                                                <p className="text-sm text-muted-foreground">{run.platform}</p>
                                                                            </div>
                                                                            <div className="col-span-2">
                                                                                <Label className="text-sm font-medium">URL</Label>
                                                                                <p className="text-sm text-muted-foreground break-all">{run.url}</p>
                                                                            </div>
                                                                            <div>
                                                                                <Label className="text-sm font-medium">Status</Label>
                                                                                <div className="mt-1">{getStatusBadge(run.status)}</div>
                                                                            </div>
                                                                            <div>
                                                                                <Label className="text-sm font-medium">Run ID</Label>
                                                                                <p className="text-sm text-muted-foreground font-mono">{run.run_id || "-"}</p>
                                                                            </div>
                                                                            {run.error_message && (
                                                                                <div className="col-span-2">
                                                                                    <Label className="text-sm font-medium text-red-600">Error Message</Label>
                                                                                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                                                                        {run.error_message}
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                            {run.feedback && (
                                                                                <div className="col-span-2">
                                                                                    <Label className="text-sm font-medium">Feedback</Label>
                                                                                    <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                                                                        {run.feedback}
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </DialogContent>
                                                                </Dialog>

                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                setSelectedRun(run)
                                                                                setFeedback(run.feedback || "")
                                                                            }}
                                                                        >
                                                                            <MessageSquare className="h-4 w-4" />
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent>
                                                                        <DialogHeader>
                                                                            <DialogTitle>Add Feedback - Run #{run.id}</DialogTitle>
                                                                            <DialogDescription>
                                                                                Add or update feedback for this processing run
                                                                            </DialogDescription>
                                                                        </DialogHeader>
                                                                        <div className="space-y-4 py-4">
                                                                            <div>
                                                                                <Label htmlFor="feedback">Feedback</Label>
                                                                                <Textarea
                                                                                    id="feedback"
                                                                                    placeholder="Enter your feedback..."
                                                                                    value={feedback}
                                                                                    onChange={(e) => setFeedback(e.target.value)}
                                                                                    rows={4}
                                                                                />
                                                                            </div>
                                                                            <div className="flex justify-end gap-2">
                                                                                <DialogTrigger asChild>
                                                                                    <Button variant="outline">Cancel</Button>
                                                                                </DialogTrigger>
                                                                                <DialogTrigger asChild>
                                                                                    <Button onClick={handleFeedbackSubmit}>Save Feedback</Button>
                                                                                </DialogTrigger>
                                                                            </div>
                                                                        </div>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {pagination.totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                                            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(pagination.page - 1)}
                                                disabled={pagination.page <= 1}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                                    const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i
                                                    return (
                                                        <Button
                                                            key={pageNum}
                                                            variant={pageNum === pagination.page ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => handlePageChange(pageNum)}
                                                            className="w-8 h-8 p-0"
                                                        >
                                                            {pageNum}
                                                        </Button>
                                                    )
                                                })}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(pagination.page + 1)}
                                                disabled={pagination.page >= pagination.totalPages}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

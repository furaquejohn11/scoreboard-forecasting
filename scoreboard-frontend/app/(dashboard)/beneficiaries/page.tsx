import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, Download } from "lucide-react"

export default function BeneficiariesPage() {
  // Sample data for demonstration
  const beneficiaries = [
    { id: "B001", name: "John Smith", age: 72, category: "Elderly", region: "North", status: "Active", amount: 450 },
    { id: "B002", name: "Maria Garcia", age: 8, category: "Children", region: "South", status: "Active", amount: 320 },
    {
      id: "B003",
      name: "Robert Johnson",
      age: 45,
      category: "Disabled",
      region: "East",
      status: "Active",
      amount: 520,
    },
    {
      id: "B004",
      name: "Sarah Williams",
      age: 36,
      category: "Low Income",
      region: "Central",
      status: "Pending",
      amount: 380,
    },
    { id: "B005", name: "David Brown", age: 52, category: "Unemployed", region: "West", status: "Active", amount: 410 },
    {
      id: "B006",
      name: "Jennifer Davis",
      age: 29,
      category: "Low Income",
      region: "North",
      status: "Inactive",
      amount: 0,
    },
    {
      id: "B007",
      name: "Michael Miller",
      age: 67,
      category: "Elderly",
      region: "South",
      status: "Active",
      amount: 450,
    },
    { id: "B008", name: "Lisa Wilson", age: 12, category: "Children", region: "East", status: "Active", amount: 320 },
    { id: "B009", name: "James Moore", age: 41, category: "Disabled", region: "Central", status: "Pending", amount: 0 },
    {
      id: "B010",
      name: "Patricia Taylor",
      age: 33,
      category: "Low Income",
      region: "West",
      status: "Active",
      amount: 380,
    },
  ]

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Beneficiaries</h1>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Beneficiary Database</CardTitle>
            <CardDescription>View and manage welfare beneficiaries in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input placeholder="Search beneficiaries..." className="pl-8" />
              </div>
              <Button variant="outline" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {beneficiaries.map((beneficiary) => (
                    <TableRow key={beneficiary.id}>
                      <TableCell className="font-medium">{beneficiary.id}</TableCell>
                      <TableCell>{beneficiary.name}</TableCell>
                      <TableCell>{beneficiary.age}</TableCell>
                      <TableCell>{beneficiary.category}</TableCell>
                      <TableCell>{beneficiary.region}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            beneficiary.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : beneficiary.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {beneficiary.status}
                        </span>
                      </TableCell>
                      <TableCell>{beneficiary.amount > 0 ? `$${beneficiary.amount}` : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{" "}
                <span className="font-medium">100</span> results
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

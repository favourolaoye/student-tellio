import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Tellio</h1>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Welcome to Tellio</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
              Your trusted platform for reporting incidents and getting the assistance you need.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/register">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 text-center">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-3">Easy Reporting</h3>
                <p className="text-gray-600">Report incidents quickly and efficiently through our platform.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-3">AI Assistant</h3>
                <p className="text-gray-600">Get help from our intelligent chatbot powered by OpenAI.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-3">Track Progress</h3>
                <p className="text-gray-600">Monitor the status of your reported incidents in real-time.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Tellio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

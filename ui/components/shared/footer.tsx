export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 text-gray-600 py-4 text-center shadow-inner">
      © {new Date().getFullYear()} — All rights reserved
    </footer>
  )
}

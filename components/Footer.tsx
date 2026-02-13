export default function Footer() {
  return (
    <footer className="bg-black text-white px-10 py-20 border-t border-white/10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-10">
        
        <div>
          <h3 className="text-xl font-light mb-4">Jonathan Denis-Quanquin</h3>
        </div>

        <div className="text-white/60 text-sm">
          © {new Date().getFullYear()} Anthony Quattrochi
        </div>

      </div>
    </footer>
  );
}

export default function Header({ address }) {
    return (
      <div className="md:flex md:items-center md:justify-between bg-white">
        <div className="min-w-0 flex-1">
          <h2 className="font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Web3RSVP
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-gray-300 border-emerald-600 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {address}
          </button>
        </div>
      </div>
    )
  }
  
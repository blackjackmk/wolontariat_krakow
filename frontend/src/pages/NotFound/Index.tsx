import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="py-12 text-center">
      <h1 className="text-3xl font-semibold">404 - Not Found</h1>
      <p className="mt-2 text-gray-700">The page you are looking for does not exist.</p>
      <p className="mt-4">
        <Link className="text-blue-600 hover:underline" to="/">Go back home</Link>
      </p>
    </section>
  );
}


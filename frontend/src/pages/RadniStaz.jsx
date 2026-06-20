<Route
  path="/radni-staz"
  element={
    korisnik?.uloga === "admin" ? (
      <RadniStaz />
    ) : (
      <Navigate to="/godisnji" />
    )
  }
/>
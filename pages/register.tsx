import { useState } from "react";
import { useRouter } from "next/router";
import { Button, TextInput, PasswordInput, Paper, Title, Text, Group } from "@mantine/core";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email || !password || !firstName || !lastName || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName }),
      });
      if (res.ok) {
        setSuccess("Registration successful! You can now log in.");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        const data = await res.json();
        setError(data.error || "Registration failed.");
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Paper shadow="md" p={32} radius="md" style={{ minWidth: 320 }}>
        <Title order={2} align="center" mb="md">Register</Title>
        <form onSubmit={handleRegister}>
          <TextInput
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            mb="sm"
          />
          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            mb="sm"
          />
          <PasswordInput
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            mb="sm"
          />
          <TextInput
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            mb="sm"
          />
          <TextInput
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            mb="md"
          />
          {error && <Text color="red" size="sm" mb="sm">{error}</Text>}
          {success && <Text color="green" size="sm" mb="sm">{success}</Text>}
          <Group position="apart" mt="md">
            <Button type="submit">Register</Button>
            <Button variant="subtle" onClick={() => router.push("/login")}>Back to Login</Button>
          </Group>
        </form>
      </Paper>
    </div>
  );
}

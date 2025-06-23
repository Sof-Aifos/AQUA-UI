import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { Button, TextInput, PasswordInput, Paper, Title, Text, Group } from "@mantine/core";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }
    const res = await signIn("credentials", {
      redirect: false,
      email: username,
      password,
    });
    if (res?.ok) {
      router.push("/");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Paper shadow="md" p={32} radius="md" style={{ minWidth: 320 }}>
        <Title order={2} align="center" mb="md">Login</Title>
        <form onSubmit={handleLogin}>
          <TextInput
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            mb="sm"
          />
          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            mb="md"
          />
          {error && <Text color="red" size="sm" mb="sm">{error}</Text>}
          <Group position="apart" mt="md">
            <Button type="submit">Login</Button>
            <Button variant="subtle" onClick={() => router.push("/register")}>Register</Button>
          </Group>
        </form>
      </Paper>
    </div>
  );
}

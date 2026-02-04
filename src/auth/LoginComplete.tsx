import axios from "axios"
import { jwtDecode } from "jwt-decode"
import { useNavigate } from "react-router"
import { setAccessToken } from "../libs/http"
import { userSchema, type User } from "../libs/types"
import React, { useEffect } from "react"
import { Flex, Title } from "@mantine/core"


function LoginComplete({ setUser } : {setUser: React.Dispatch<User | null>}) {
  const navigate = useNavigate();

  useEffect(() => {
    axios.post(`${import.meta.env.VITE_API_URL}/api/auth/refresh`, {}, {withCredentials: true}).then((res) => {
      const token = res.data?.token
    
      if (typeof token !== "string") throw new Error("Token is not string")

      setAccessToken(token);
      
      const userFromJWT = jwtDecode(token)
      const typedUser = userSchema.safeParse(userFromJWT)
      if (!typedUser.success) throw new Error("Incorrect Form of user in accessToken")
      
      setUser(typedUser.data)
      navigate("/")

      // todo: add double check if the optimistic user matches /api/auth/verify

    }).catch((err) => {
      console.log(err)
      setUser(null);
      alert("Login Failed. Please Try again.")
      navigate("/login", { replace: true })
    })
  })
  return (
    <Flex w="100%" h="100%" justify="center" align="center">
      <Title order={1}>Signing you in...</Title>
    </Flex>
  )
}

export default LoginComplete
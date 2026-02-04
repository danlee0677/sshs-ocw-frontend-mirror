import { Image, Title } from "@mantine/core";
import { type User } from "../libs/types";
import MainPageAppshell from "../main/MainPageAppshell";
import { useNavigate, useParams } from "react-router";
import { http } from "../libs/http";
import classes from "./Profile.module.css"
import { useEffect, useState } from "react";
import { PLACEHOLDER_USER } from "../libs/utils";

function Profile({ user, setUser }: { user: User | null, setUser: React.Dispatch<User | null> }) {
  const { pageUserId } = useParams();

  const [PageUser, setPageUser] = useState<User>(PLACEHOLDER_USER)
  const navigate = useNavigate()

  useEffect(() => {
    if (!pageUserId) {
      navigate('/notfound')
    }
    else if (user?._id && pageUserId === user._id) {
      setPageUser(user);
    }
    else {
      http.get(`${import.meta.env.VITE_API_URL}/api/user/${pageUserId}`).then((res) => {
        setPageUser((val) => ({ ...val, _id: pageUserId, username: res.data.username, pfp_url: res.data.pfp_url }))
      })
    }
  }, [pageUserId, navigate])

  return (
    <>
      <MainPageAppshell user={user} setUser={setUser} navigate={navigate}>
        <Image w={'200px'} src={PageUser.pfp_url}></Image>
        <Title className={classes.JalnanGothic}>{PageUser.username}</Title>
      </MainPageAppshell>
    </>
  )
}

export default Profile
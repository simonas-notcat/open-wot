import React, { useContext, useState } from 'react'
import { Flex } from 'rimble-ui'
import ActivityItem from '../../components/ActivityItem/ActivityItem'
import Page from '../../layout/Page'
import Credential from '../../components/Credential/Credential'
import * as queries from '../../gql/queries'
import { AppContext } from '../../context/AppProvider'
import { useQuery } from '@apollo/react-hooks'
import { useHistory, useRouteMatch } from 'react-router-dom'

interface Activity {}

const Activity: React.FC<Activity> = () => {
  const [appState] = useContext(AppContext)
  const history = useHistory()
  const { url } = useRouteMatch()

  const { data } = useQuery(queries.allMessages, {
    variables: { activeDid: appState.defaultDid },
  })

  return (
    <Page title={'Activity'}>
      <a href={"https://slack.com/oauth/authorize?scope=commands,chat:write:bot,users.profile:read&client_id=649451385750.920859329507"}>
        <img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>
      {data?.identity?.messagesAll?.map((msg: any) => (
        <ActivityItem
          viewerDid={appState.defaultDid}
          id={msg.id}
          date={msg.timestamp * 1000}
          type={msg.type}
          key={msg.id}
          sender={msg.sender}
          receiver={msg.receiver}
          showRequest={() => history.push(`${url}/sdr/${msg.id}`)}
          attachments={msg.vc}
          renderAttachments={(attachment: any) => (
            <Credential
              iss={attachment.iss}
              sub={attachment.sub}
              key={attachment.hash}
              onClick={() => history.push(`${url}/credential/${attachment.hash}`)}
              fields={attachment.fields}
            />
          )}
        />
      ))}
    </Page>
  )
}

export default Activity
